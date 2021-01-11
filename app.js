const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';


function fetchData(url) {
  return fetch(url).then(function (response) {
    return response.json();
  }).catch(function (error) {
    console.error(error);
  });
}


function fetchUsers() {
  return fetchData(`${BASE_URL}/users`);
  }

  fetchUsers().then(function (data) {
    console.log(data);
  });


  function renderUser(user) {
    return $(`<div class="user-card">
      <header>
        <h2>${user.name}</h2>
      </header>
      <section class="company-info">
        <p><b>Contact:</b> ${user.email}</p>
        <p><b>Works for:</b> ${user.company.name}</b></p>
        <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
      </section>
      <footer>
        <button class="load-posts">POSTS BY ${user.username}</button>
        <button class="load-albums">ALBUMS BY ${user.username}</button>
      </footer>
    </div>`).data('user', user);
  }
  
  function renderUserList(userList) {
    const uList = $('#user-list');
    uList.empty();

    userList.forEach(function (user) {
      uList.append(renderUser(user));
    });
  }

  fetchUsers().then(function (data) {
    renderUserList(data);
  });

function fetchUserAlbumList(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`);
}

function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}


/* render a single album */
function renderAlbum(album) {
  const albumCard = $(`<div class="album-card">
    <header>
      <h3>${album.title}, by ${album.user.username}</h3>
    </header>
    <section class="photo-list">
    </section>
  </div>`);

  const photoList = albumCard.find('.photo-list');

  album.photos.forEach(function (photo) {
    photoList.append( renderPhoto(photo));
  });

  return albumCard;
}

/* render a single photo */
function renderPhoto(photo) {
  return $(`<div class="photo-card">
    <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}" />
      <figure>${photo.title}</figure>
    </a>
  </div>`);
}


/* render an array of albums */
function renderAlbumList(albumList) {
  $('#app section.active').removeClass('active');

  $('#album-list').empty().addClass('active');

  albumList.forEach(function (album) {
    $('#album-list').append( renderAlbum(album));
  });
}


$('#user-list').on('click', '.user-card .load-posts', function () {
  const user = $(this).closest('.user-card').data('user');

  fetchUserPosts(user.id)
    .then(renderPostList);
});
  
  $('#user-list').on('click', '.user-card .load-albums', function () {
    const user = $(this).closest('.user-card').data('user');
    
    fetchUserAlbumList(user.id)
      .then(renderAlbumList);
  });

  function setCommentsOnPost(post) {
    if (post.comments) {
      return Promise.reject(null);
    }
  
    return fetchPostComments(post.id)
      .then(function (comments) {
        post.comments = comments;
        return post;
    });
  }

  function renderPost(post) {
    return $(`<div class="post-card">
      <header>
        <h3>${post.title}</h3>
        <h3>---${post.user.username}</h3>
      </header>
      <p>${post.body}</p>
      <footer>
        <div class="comment-list"></div>
        <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
      </footer>
    </div>`).data('post', post)
  }
  
  function renderPostList(postList) {
    $('#app section.active').removeClass('active');
  
    $('#post-list').empty().addClass('active');
  
    postList.forEach(function (post) {
      $('#post-list').append( renderPost(post) );
    });
  }

  function toggleComments(postCardElement) {
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {
      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');
    } else {
      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    }
  }

  $('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');
    const commentListElement = postCardElement.find('.comment-list');
  
    setCommentsOnPost(post)
      .then(function (post) {
        console.log('building comments for the first time...')
        
        commentListElement.empty();
        post.comments.forEach(function (comment) {
          commentListElement.prepend($(`
            <h3>${comment.body} --- ${comment.email}</h3>
          `));
        });
        toggleComments(postCardElement);
      })
      .catch(function () {
        console.log('comments previously existed, only toggling..')
        
        toggleComments(postCardElement);
      });
  });
  


  async function bootstrap() {
    const userList = await fetchUsers()

    renderUserList(userList)
  }
  
bootstrap();