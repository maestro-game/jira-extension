
document.addEventListener('DOMContentLoaded', function () {
    fetchJiraIssues()
});

function fetchJiraIssues() {
    chrome.storage.sync.get(['token', 'email', 'projectUrl'], function (data) {
        fetch(data.projectUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(data.email+':'+data.token),
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

function displayIssues(issues: any) {
    const issueList = document.getElementById('issueList')

    issues.forEach((issue: any) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${issue.key} - ${issue.fields.summary}`
        issueList?.appendChild(listItem)
    })
}