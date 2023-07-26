const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 0;

// GET ALL POSTS:
async function getAllPosts(page = 1, emptying = true) {
    try {
        toggleLoader();

        const res = await axios.get(`${baseUrl}/posts?limit=4&page=${page}`);
        const posts = res.data.data;
        lastPage = res.data.meta.last_page;

        if (emptying) {
            document.getElementById("posts").innerHTML = "";
        };

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


// PAGINATION (INFINITE SCROLL):
function handleInfiniteScroll() {
    window.addEventListener("scroll", () => {
        const scrollPosition = Math.ceil(window.scrollY);
        const endOfPage = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollPosition === endOfPage && currentPage <= lastPage) {
            getAllPosts(++currentPage, false);
        };
    });
};


handleInfiniteScroll();