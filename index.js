const core = require("@actions/core");
const github = require("@actions/github");
const showdown = require("showdown");

const markdown = new showdown.Converter();

(async () => {
  try {
    const title = core.getInput("name");
    const body = core.getInput("body");
    const html = markdown.makeHtml(body);
    const slug = core.getInput("slug");
    const apiKey = core.getInput("apiKey");

    console.log({ title, body, html, slug });

    // console.log(`Hello ${nameToGreet}!`);
    // const time = new Date().toTimeString();
    // core.setOutput("time", time);
    // // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
