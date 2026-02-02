export const hasResume = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.skills && user.skills.length > 0;
};
