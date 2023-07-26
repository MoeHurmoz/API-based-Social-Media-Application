const baseUrl = "https://tarmeezacademy.com/api/v1";
const urlParams = new URLSearchParams(window.location.search);
const userId = parseInt(urlParams.get("userId").replaceAll('"', ''));


// GET USER DATA:
async function getUser() {
    try {
        const res = await axios.get(`${baseUrl}/users/${userId}`);
        const userData = res.data.data;

        const usernameElements = document.getElementsByClassName("username");
        for (let element of usernameElements) {
            element.innerHTML = userData.username;
        };

        document.getElementById("profile-img").src = typeof userData.profile_image == "string" ? userData.profile_image : "../default-images/AV.JPG";
        document.getElementById("name").innerHTML = userData.name;
        document.getElementById("email").innerHTML = userData.email;
        document.getElementById("posts-count").innerHTML = userData.posts_count;
        document.getElementById("comments-count").innerHTML = userData.comments_count;
    } catch (err) {
        errMessage(err);
    };
};


// GET USER POSTS:
async function getUserPosts() {
    try {
        toggleLoader();

        const res = await axios.get(`${baseUrl}/users/${userId}/posts`);
        const posts = res.data.data.reverse();

        document.getElementById("posts").innerHTML = "";

        for (const post of posts) {
            const id = post.id;
            const avatar = post.author.profile_image;
            const userName = post.author.username;
            const img = post.image;
            const createdAt = post.created_at;
            const title = post.title;
            const body = post.body;
            const comments = post.comments_count;

            const htmlContent = `<div class="card shadow my-4">
                                    <div class="card-header">
                                        <button type="button" class="border-0 rounded-circle p-0 bg-light" onclick="userClicked(${post.author.id})">
                                            <img src="${typeof avatar == "string" ? avatar : "../default-images/AV.JPG"}" id="avatar" class="rounded-circle border border-2">
                                        </button>
                                        <button type="button" class="btn p-0" id="username-buttons" onclick="userClicked(${post.author.id})">
                                            <b>${userName}</b>
                                        </button>
                                        ${threeDotsBtn(post)}
                                    </div>
                                    <div class="card-body cursor" onclick="postClicked(${id})">

                                        <img src="${typeof img == "string" ? img : "../default-images/def-img.JPG"}" class="w-100">

                                        <h6 class="text-body-tertiary mt-1">${createdAt}</h6>

                                        <h5 class="card-title">${title == null ? "" : title}</h5>
                                        <p class="card-text">${body}</p>

                                        <hr class="mb-2">

                                        <div class="d-flex align-items-center pt-0 mt-0">
                                            <span class="pt-2 me-1"><i class="bi bi-chat-left-text"></i></span>
                                            <span>(${comments}) Comments</span>
                                            <span id="post-tags-${id}" class="ms-2"> </span>
                                        </div>
                                    </div>
                                </div>`;

            document.getElementById("posts").innerHTML += htmlContent;

            // TAGS FILLING:
            for (const tag of post.tags) {
                document.getElementById(`post-tags-${id}`).innerHTML += `<button class="btn btn-sm btn-secondary rounded-5 text-light me-1">${tag.name}</button>`;
            };
        };
    } catch (err) {
        errMessage(err);
    } finally {
        toggleLoader(false);
    }
};


// SHOW OR HIDE "ADD (+)" BUTTON:
function toggleAddBtn() {
    const showUp = currentUser() != null && userId == currentUser().id;
    if (showUp) {
        document.getElementById("add-btn").style.setProperty("display", "flex", "important");
    } else {
        document.getElementById("add-btn").style.setProperty("display", "none", "important");
    };
};