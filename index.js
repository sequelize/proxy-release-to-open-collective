const core = require("@actions/core");
const github = require("@actions/github");
const showdown = require("showdown");
const { GraphQLClient, gql } = require("graphql-request");

const markdown = new showdown.Converter();

async function getRelease() {
  const releaseId = core.getInput("releaseId");
  const [owner, repo] = core.getInput("projectSlug").split("/");
  const slug = core.getInput("ocSlug");

  core.info("Input params:");
  core.info(`Release ID: ${releaseId}`);
  core.info(`GitHub Project Slug: ${owner}/${repo}`);
  core.info(`OpenCollective Slug: ${slug}`);

  const githubToken = core.getInput("githubToken");
  const octokit = github.getOctokit(githubToken);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/releases/{releaseId}",
    { owner, repo, releaseId }
  );

  core.debug(data);

  return data;
}

async function postOnOpenCollective(release) {
  const { name, body } = release;
  const title = `Release of Sequelize ${name}`;
  const _html = markdown.makeHtml(body);
  const html = _html.replace(/"/g, '\\"').replace(/\n/g, "\\n");

  const query = gql`
    mutation {
      createUpdate(update: { 
        title: \"${title}\", 
        html: \"${html}\", 
        account: {slug: \"sequelize\"} 
      }) {
        id
        title
      }
    }
  `;
  const apiKey = core.getInput("ocApiKey");
  const endpoint = "https://api.opencollective.com/graphql/v2";
  const client = new GraphQLClient(endpoint, {
    headers: { "Api-Key": apiKey },
  });
  const { createUpdate } = await client.request(query);

  core.info(JSON.stringify(createUpdate));

  return createUpdate;
}

async function publishUpdateOnOpenCollective(update) {
  const query = gql`
    mutation {
      publishUpdate(id:"${update.id}") { id }
    }
  `;
  const apiKey = core.getInput("ocApiKey");
  const endpoint = "https://api.opencollective.com/graphql/v2";
  const client = new GraphQLClient(endpoint, {
    headers: { "Api-Key": apiKey },
  });

  core.info(query);
  await client.request(query);
}

(async () => {
  try {
    const release = await getRelease();
    const update = await postOnOpenCollective(release);
    await publishUpdateOnOpenCollective(update);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
})();
