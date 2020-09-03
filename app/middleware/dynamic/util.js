'use strict';

module.exports = {
  teamLink(team) {
    return `{"type": "teamLink", "id": "${team.id}", "name": "${team.name}"}`;
  },
  projectLink(project) {
    return `{"type": "projectLink", "id": "${project.id}", "name": "${project.name}"}`;
  },
  categoryLink(category) {
    return `{
      "type": "projectLink",
      "id": "${category.id}",
      "name": "${category.name}",
      "projectId": "${category.projectId}",
    }`;
  },
  userLink(user) {
    return `{"type": "userLink", "id": "${user.id}", "name": "${user.name}"}`;
  },
  roleTag(role) {
    return `{"type": "roleTag", "role": "${role}"}`;
  },
};
