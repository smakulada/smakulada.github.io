// Use cors-anywhere proxy for testing (users must request access at cors-anywhere.herokuapp.com)
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

let baseUrl = 'https://safebooru.org'; // Default source

let baseApiUrl = `${baseUrl}/index.php?page=dapi&s=post&q=index&tags=yuri+kiss+2girls&json=1&limit=100`;
let posts = [];

// Fetch 300 images across 3 pages (100 images per page)
async function fetchImages() {
    try {
        const pages = [0, 1, 2]; // Fetch pages 0, 1, 2 for up to 300 images
        const fetchPromises = pages.map(page => 
            fetch(`${proxyUrl}${baseApiUrl}&pid=${page}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok for page ${page}`);
                    }
                    return response.json();
                })
        );
        const results = await Promise.all(fetchPromises);
        // Combine all posts into a single array
        posts = results.flat().filter(post => post.directory && post.image); // Ensure valid posts
        posts.sort(() => Math.random() - 0.5); // Shuffle posts
        if (posts.length > 0) {
            const imageUrl = `${baseUrl}/images/${posts[0].directory}/${posts[0].image}`;
            document.querySelector("img").src = imageUrl;
            console.log(posts[0]);
            document.getElementById("post_tags").innerText = posts[0].tags;
        } else {
            console.error("No valid posts found.");
            document.querySelector("img").alt = "No images available";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector("img").alt = "Failed to load image";
    }
}
let index = 0;
function changeImage() {
    index = (index + 1) % posts.length;
    if (posts.length > 0) {
        const imageUrl = `${baseUrl}/images/${posts[index].directory}/${posts[index].image}`;
        document.querySelector("img").src = imageUrl;
        document.getElementById("post_tags").innerText = posts[index].tags;
    } else {
        console.error("No posts available to display.");
        document.querySelector("img").alt = "No images available";
    }
}
function start(){
    toggleSettings();
    const form = document.getElementById('setup');
    const program = document.getElementById('program');
    const source = form.elements['source'].value;
    if (source === 'safebooru') {
        baseUrl = "https://safebooru.org";
    }
    else if (source === 'rule34') {
        baseUrl = "https://rule34.xxx";
    }
    const tags = form.elements['tags'].value;
    const interval = parseInt(form.elements['interval'].value, 10) * 1000;
    if (tags.trim() !== '') {
        console.log("User provided tags:", tags.split(' ').join('+'));
        // Update the baseApiUrl with user-provided tags
        baseApiUrl = `${baseUrl}/index.php?page=dapi&s=post&q=index&tags=${(tags.split(' ').join('+'))}&json=1&limit=100`;
        console.log("Updated API URL:", baseApiUrl);
    }
    // form.style.display = 'none';
    program.style.display = 'flex';
    // Fetch images on page load
    fetchImages();
    // Change image every 10 seconds
    setInterval(changeImage, interval);
}

function toggleSettings() {
    const settingsContent = document.getElementById('settingsContent');
    settingsContent.classList.toggle('show');
}