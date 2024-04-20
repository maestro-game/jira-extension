document.addEventListener('DOMContentLoaded', function () {
    fetchJiraIssues()
});

function fetchJiraIssues() {
    const jiraUrl = 'https://smtchekin.atlassian.net/rest/api/2/search?jql=project=SPO&assignee=currentuser()'

    fetch(jiraUrl, {
        headers: {
            'Authorization': 'Basic ' + btoa('EMAIL:TOKEN'),
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
}

function displayIssues(issues: any) {
    const issueList = document.getElementById('issueList')

    issues.forEach((issue: any) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${issue.key} - ${issue.fields.summary}`
        issueList?.appendChild(listItem)
    })
}