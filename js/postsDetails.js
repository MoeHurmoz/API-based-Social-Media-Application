const baseUrl = "https://tarmeezacademy.com/api/v1";
const urlParams = new URLSearchParams(window.location.search);
const postId = parseInt(urlParams.get("postId").replaceAll('"', ''));


// GET POST DETAILS:
async function getOnePost() {
    try {
        toggleLoader();

        const res = await axios.get(`${baseUrl}/posts/${postId}`);
        const post = res.data.data;

        const id = post.id;
        const avatar = post.author.profile_image;
        const userName = post.author.username;
        const img = post.image;
        const createdAt = post.created_at;
        const title = post.title;
        const body = post.body;
        const commentsCount = post.comments_count;

        const htmlContent = `<h2 class="p-0 mb-5">${userName} Post</h2>
                            <div class="card shadow my-4">
                                <div class="card-header">
                                    <button type="button" class="border-0 rounded-circle p-0 bg-light" onclick="userClicked(${post.author.id})">
                                        <img src="${typeof avatar == "string" ? avatar : "../default-images/AV.JPG"}" id="avatar" class="rounded-circle border border-2">
                                    </button>
                                    <button type="button" class="btn p-0" id="username-buttons" onclick="userClicked(${post.author.id})">
                                        <b>${userName}</b>
                                    </button>
                                    ${threeDotsBtn(post)}
                                </div>
                                <div class="card-body">

                                    <img src="${typeof img == "string" ? img : "../default-images/def-img.JPG"}" class="w-100">

                                    <h6 class="text-body-tertiary mt-1">${createdAt}</h6>

                                    <h5 class="card-title">${title == null ? "" : title}</h5>
                                    <p class="card-text">${body}</p>

                                    <hr>

                                    <div class="d-flex align-items-center">
                                        (${commentsCount}) Comments
                                        <span id="post-tags-${id}" class="ms-2"> </span>
                                    </div>

                                    <div id="add-comment-div" class="d-flex align-items-center justify-content-center mt-3"> </div>
                                </div>

                                <div id="post-comments" class="card-footer border-0 bg-body-secondary"> </div>

                            </div>`;

        document.getElementById("post").innerHTML = htmlContent;

        // TAGS FILLING:
        for (const tag of post.tags) {
            document.getElementById(`post-tags-${id}`).innerHTML += `<button class="btn btn-sm btn-secondary rounded-5 text-light me-1">${tag.name}</button>`;
        };

        // COMMENTS FILLING:
        for (const comment of post.comments.reverse()) {
            document.getElementById("post-comments").innerHTML += ` <div class="d-flex align-items-center mb-4">
                                                                        <button type="button" class="border-0 rounded-circle p-0 me-2 bg-light" onclick="userClicked(${comment.author.id})">
                                                                           <img src="${typeof comment.author.profile_image == "string" ? comment.author.profile_image : "../default-images/AV.JPG"}" id="avatar" class="rounded-circle border border-2">
                                                                        </button>
                                                                        <div class="p-0 m-0">
                                                                           <button type="button" class="btn p-0 m-0" id="username-buttons" onclick="userClicked(${comment.author.id})">
                                                                             <b>${comment.author.username}</b>
                                                                           </button>
                                                                           <p class="card-text">${comment.body}</p>
                                                                        </div>
                                                                    </div>`;
        };

        // COMMENT INPUT FILLING:
        setupUIcommentsInput();
    } catch (err) {
        errMessage(err);
    } finally {
        toggleLoader(false);
    }
};


// SETUP UI FOR COMMENT INPUT:
function setupUIcommentsInput() {
    if (localStorage.getItem("token")) {
        const userData = JSON.parse(localStorage.getItem("user"));
        document.getElementById("add-comment-div").innerHTML = `<img src="${typeof userData.profile_image == "string" ? userData.profile_image : "../default-images/AV.JPG"}" id="avatar" class="rounded-circle border border-2">
                                                                <input id="comment-input" type="text" class="form-control rounded-pill mx-1" placeholder="Add a comment...">
                                                                <button onclick="createNewComment()" type="button" class="btn btn-outline-success rounded-pill">Send</button>`;
    } else {
        document.getElementById("add-comment-div").innerHTML = `<p class="text-danger">LOG IN TO ADD A COMMENT</p>`;
    };
};


// WHEN THE "SEND" BUTTON IS CLICKED:
function createNewComment() {
    const commentBody = document.getElementById("comment-input").value;

    if (commentBody) {
        toggleLoader();
    };

    const body = {
        "body": commentBody
    };
    const headers = {
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    };
    axios.post(`${baseUrl}/posts/${postId}/comments`, body, headers)
        .then(res => {
            getOnePost();
            alertMessage("Comment added successfully");
        })
        .catch(err => {
            toggleLoader(false);
            errMessage(err);
        });
};