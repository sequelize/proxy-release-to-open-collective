const {
  getRepo,
  getRelease,
  sanitizeProjectName,
  postOnOpenCollective,
  publishUpdateOnOpenCollective,
} = require("./helpers");

module.exports = async function proxy({
  releaseId,
  projectSlug,
  githubToken,
  ocSlug,
  ocApiKey,
}) {
  const repo = await getRepo({ projectSlug, githubToken });
  const release = await getRelease({
    releaseId,
    projectSlug,
    githubToken,
  });
  const projectName = sanitizeProjectName(repo);
  const update = await postOnOpenCollective({
    release,
    ocSlug,
    ocApiKey,
    projectName,
  });

  await publishUpdateOnOpenCollective({
    update,
    ocApiKey,
  });
};
