const core = require("@actions/core");
const github = require("@actions/github");
const showdown = require("showdown");
const { GraphQLClient, gql } = require("graphql-request");

const markdown = new showdown.Converter();

async function getRepo({ projectSlug, githubToken }) {
  const [owner, repo] = projectSlug.split("/");
  const octokit = github.getOctokit(githubToken);

  const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner,
    repo,
  });

  core.debug(data);

  return data;
}

function sanitizeProjectName(repo) {
  const fragments = new Set(
    repo.full_name
      .split("/")
      .map((s) => [s[0].toUpperCase(), s.slice(1)].join(""))
  );

  return Array.from(fragments).join(" ");
}

async function getRelease({ releaseId, projectSlug, githubToken }) {
  const [owner, repo] = projectSlug.split("/");

  core.info("Input params:");
  core.info(`Release ID: ${releaseId}`);
  core.info(`GitHub Project Slug: ${owner}/${repo}`);

  const octokit = github.getOctokit(githubToken);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/releases/{releaseId}",
    { owner, repo, releaseId }
  );

  core.debug(data);

  return data;
}

async function postOnOpenCollective({
  release,
  ocSlug,
  ocApiKey,
  projectName,
}) {
  core.info(`OpenCollective Slug: ${ocSlug}`);

  const { name, body } = release;
  const title = `Release of ${projectName} ${name}`;
  const _html = markdown.makeHtml(body);
  const html = _html
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace("<h1>", "<h2>")
    .replace("</h1>", "</h2>");

  const query = gql`
    mutation {
      createUpdate(update: { 
        title: \"${title}\", 
        html: \"${html}\", 
        account: {slug: \"${ocSlug}\"} 
      }) {
        id
        title
      }
    }
  `;
  const endpoint = "https://api.opencollective.com/graphql/v2";
  const client = new GraphQLClient(endpoint, {
    headers: { "Api-Key": ocApiKey },
  });
  const { createUpdate } = await client.request(query);

  core.info(JSON.stringify(createUpdate));

  return createUpdate;
}

async function publishUpdateOnOpenCollective({ update, ocApiKey }) {
  const query = gql`
    mutation {
      publishUpdate(id:"${update.id}") { id }
    }
  `;
  const endpoint = "https://api.opencollective.com/graphql/v2";
  const client = new GraphQLClient(endpoint, {
    headers: { "Api-Key": ocApiKey },
  });

  core.info(query);
  await client.request(query);
}

module.exports = {
  getRelease,
  postOnOpenCollective,
  publishUpdateOnOpenCollective,
  getRepo,
  sanitizeProjectName,
};
