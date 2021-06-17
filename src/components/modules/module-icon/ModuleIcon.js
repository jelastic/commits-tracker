import React from 'react'

import './ModuleIcon.css'
import GitLabIcon from "./gitlab-icon.svg"
import GitLabGroupIcon from "./gitlab-group-icon0.svg"
import GitHubIcon from "./github-icon.svg"

const GITLAB = "GitLab"

export default function ModuleIcon({ type, isGroup, className }) {
  let icon = (type === GITLAB) ? (isGroup ? GitLabGroupIcon : GitLabIcon) : GitHubIcon

  return (
    <img src={icon} className={'module-icon ' + (className || '')} alt={`${type} Module`} />
  )
}