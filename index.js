const core = require("@actions/core");
const proxy = require("./src");

try {
  proxy({
    releaseId: core.getInput("releaseId"),
    projectSlug: core.getInput("projectSlug"),
    githubToken: core.getInput("githubToken"),
    ocSlug: core.getInput("ocSlug"),
    ocApiKey: core.getInput("ocApiKey"),
  });
} catch (error) {
  core.error(error);
  core.setFailed(error.message);
}
