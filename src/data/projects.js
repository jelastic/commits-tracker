//@todo: move to public dir and use lazy loading

import GitLabService from "./../service/GitLabService"
import {GITLAB} from "../constants";

const ENV = window.ENV
const GITLAB_ROOT_GROUP_ID = 185

let isLoaded = false
let data = []

const gitHubProjects = [/*{
  key: "github-project-example",
  leaf: false,
  data: {
    shortId: "Example Projects",
    type: "GitHub",
    projectId: "github-project-example",
    group: true,
    url: "https://github.com/github-project-example"
  }
}*/]

let keys = {}

async function preload() {
  if (data.length !== 0) {
    return
  }

  const gitLabService = new GitLabService(ENV.GITLAB_SERVER_URL, ENV.GITLAB_TOKEN)
  const groups = await gitLabService.getSubgroups(GITLAB_ROOT_GROUP_ID)

  for (const group of groups) {
    data.push({
      key: group.name.toLowerCase().replace(/\s/g, "-"),
      parentKey: GITLAB_ROOT_GROUP_ID,
      leaf: false,
      data: {
        type: GITLAB,
        shortId: group.name,
        group: true,
        projectId: group.id,
        url: group.web_url
      }
    })
  }

  for (const gitHubProject of gitHubProjects) {
    data.push(gitHubProject);
  }

  data.map((item) => {
    item.name = item.data.shortId

    keys[item.key] = item

    return item
  })
}

async function getProjects() {
    if (!isLoaded) {
      await preload()
      isLoaded = true
    }

    return { data, keys }
}

const map = { getProjects, data, keys, preload }

export default map
