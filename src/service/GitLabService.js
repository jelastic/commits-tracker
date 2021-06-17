import axios from 'axios';
import Moment from "moment";
import {GITLAB_DATE_FORMAT_END, GITLAB_DATE_FORMAT_START} from "../constants";

const RESULTS_PER_PAGE = 999999999
const PROJECTS_IN_SUBGROUP_LIMIT = 100

export default class GitLabService {
    constructor(baseUrl, token) {
        this.axios = axios.create({
            baseURL: `${baseUrl}/api/`,
            headers: { 'PRIVATE-TOKEN': token }
        })
    }

    getSubgroups(groupId) {
        return this.axios.get(`v4/groups/${groupId}/subgroups`, {
            params : { per_page: RESULTS_PER_PAGE }
        }).then(res => res.data)
    }

    getGroupProjects(groupId, includeSubgroups, page, pageLimit) {
        const params = { per_page: pageLimit || RESULTS_PER_PAGE }

        if (includeSubgroups) {
            params.include_subgroups = true
        }

        if (page) {
            params.page = page
        }

        return this.axios.get(`v4/groups/${groupId}/projects`, { params }).then(res => res.data)
    }

    async getAllGroupProjects(groupId, includeSubgroups) {
        let projects = []
        let page = 1
        let currentProjects = await this.getGroupProjects(groupId, includeSubgroups, null, PROJECTS_IN_SUBGROUP_LIMIT)

        projects = projects.concat(currentProjects)

        while (currentProjects.length === PROJECTS_IN_SUBGROUP_LIMIT) {
            page++
            currentProjects = await this.getGroupProjects(groupId, includeSubgroups, page, PROJECTS_IN_SUBGROUP_LIMIT)
            projects = projects.concat(currentProjects)
        }

        return projects
    }

    async getAllSubgroupProjects(groupId) {
        return await this.getAllGroupProjects(groupId, true)
    }

    getCommits(projectId, dateFrom, dateTo) {
        dateFrom = Moment(dateFrom).format(GITLAB_DATE_FORMAT_START)
        dateTo = Moment(dateTo).format(GITLAB_DATE_FORMAT_END)

        return this.axios.get(`v4/projects/${projectId}/repository/commits`, {
            params: {
                since: dateFrom,
                until: dateTo,
                all: 'true',
                per_page: RESULTS_PER_PAGE
            }
        }).then(res => res.data)
    }
}