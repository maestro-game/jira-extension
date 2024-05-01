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
        fetch(extData.apiUrl + 'search?jql=' + encodeURI('project=SPO&assignee=currentuser()'), {
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

function getIssue(issuekey: string): Promise<any> {
    return fetch(extData.apiUrl + `issue/${issuekey}`, {
        headers: {
            'Authorization': 'Basic ' + btoa(extData.email + ':' + extData.token),
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error fetching issue:', error)
    })

}

function changeStatus(issue: any, transitionId: number) {
    console.log(JSON.stringify({
        transition: {
            id: transitionId
        }
    }))
    fetch(extData.apiUrl + `issue/${issue.key}/transitions`, {
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + btoa(extData.email + ':' + extData.token),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            transition: {
                id: transitionId
            }
        })
    })
    .then(() => {
        const issueElem = document.getElementById(`issue-${issue.key}`)
        issueElem!.innerHTML = ''
        getIssue(issue.key)
        .then(issue => {
            drawIssue(issueElem!, issue)
            displayStatuses(issue, document.getElementById(`ac_body_${issue.key}`)!)
        })
    })
    .catch(error => {
        console.error('Error changing issue status:', error)
    })
}

function displayStatuses(issue: any, element: HTMLElement) {
    fetch(extData.apiUrl + `issue/${issue.key}/transitions`, {
        headers: {
            'Authorization': 'Basic ' + btoa(extData.email + ':' + extData.token),
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        data.transitions.forEach((transition: any) => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-primary', 'btn-sm');
            button.innerText = transition.name;
            button.onclick = () => {
                changeStatus(issue, transition.id)
            };
            element.appendChild(button);
        })
    })
    .catch(error => {
        console.error('Error fetching issue status:', error)
    })
}

function displayComments(issue: any, element: HTMLElement) {
    fetch(extData.apiUrl + `issue/${issue.key}/comment`, {
        headers: {
            'Authorization': 'Basic ' + btoa(extData.email + ':' + extData.token),
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        element.innerHTML = ''
        data.comments.forEach((comment: any) => {
            const row = document.createElement('li');
            row.classList.add('list-group-item');
            row.innerHTML = `
                <div>${comment.author.displayName}</div>
                <div>${comment.body}</div>
            `
            element.appendChild(row);
        })
    })
    .catch(error => {
        console.error('Error fetching issue status:', error)
    })
}

function drawIssue(issueElem: HTMLElement, issue: any) {
    issueElem!.innerHTML = `
        <h2 class="accordion-header" id="ac_head_${issue.key}">
            <a target="_blank" class="accordion-button" href="${extData.projectUrl}browse/${issue.key}">${issue.key}</a>
            <button class="accordion-button collapsed" aria-expanded="false" type="button" data-bs-toggle="collapse" data-bs-target="#ac_col_${issue.key}" aria-controls="collapseOne">
                 - ${issue.fields.summary} - <span class="badge text-bg-light">${issue.fields.status.name}</span>
            </button>
        </h2>
        <div id="ac_col_${issue.key}" class="accordion-collapse collapse" aria-labelledby="ac_head_${issue.key}" data-bs-parent="#accordionExample">
            <div class="accordion-body" id="ac_body_${issue.key}">
                
            </div>
            <div class="accordion-body">
                ${issue.fields.description}
            </div>
            <ul class="list-group" id="ac_comm_${issue.key}">
                No comments
            </ul>
        </div>
        `
}

function displayIssues(issues: any) {
    const issueList = document.getElementById('issueList')

    issues.forEach((issue: any) => {
        const issueElem = document.createElement('div')
        issueElem.id = `issue-${issue.key}`
        drawIssue(issueElem, issue)
        issueList?.appendChild(issueElem)
        displayStatuses(issue, document.getElementById(`ac_body_${issue.key}`)!)
        displayComments(issue, document.getElementById(`ac_comm_${issue.key}`)!)
    })
}
