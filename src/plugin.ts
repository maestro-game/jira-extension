import { ExtensionData } from "./extension-data";

const extData = new ExtensionData();

document.addEventListener('DOMContentLoaded', function () {
    fetchJiraIssues()
});

function fetchJiraIssues() {
    chrome.storage.sync.get(['token', 'email', 'projectUrl'], function (data) {
        extData.token = data.token
        extData.email = data.email
        extData.projectUrl = data.projectUrl
        extData.apiUrl = extData.projectUrl + 'rest/api/2/'
        fetch(extData.apiUrl + 'search?' + encodeURI('jql=project=SPO&assignee=currentuser()'), {
            headers: {
                'Authorization': 'Basic ' + btoa(extData.email + ':' + extData.token),
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            displayIssues(data.issues)
        })
        .catch(error => {
            console.error('Error fetching Jira issues:', error)
        })
    });
}

function displayStatuses(issueKey: string, element: HTMLElement) {
    fetch(extData.apiUrl + `/issue/${issueKey}/transitions`, {
        headers: {
            'Authorization': 'Basic ' + btoa(extData.email + ':' + extData.token),
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        data.transitions.forEach((transition: any) => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-primary', 'm-1');
            button.innerText = transition.name;
            button.onclick = () => {
                console.log('Transition ID:', transition.id);
            };
            element.appendChild(button);
        })
    })
    .catch(error => {
        console.error('Error fetching issue status:', error)
    })
}

function displayIssues(issues: any) {
    const issueList = document.getElementById('issueList')

    issues.forEach((issue: any) => {
        const listItem = document.createElement('li');
        listItem.classList.add("list-group-item")
        listItem.textContent = `${issue.key} - ${issue.fields.summary}`
        displayStatuses(issue.key, listItem)
        issueList?.appendChild(listItem)
    })
}