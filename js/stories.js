"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">("${hostName}")</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


/** Make delete button HTML for story */

function getDeleteBtnHTML() {
  return `
      <span class="trash">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

/** Make favorite/not-favorite star for story */

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Favorites */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favorites.empty();

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favorites.append($story);
  }

  $favorites.show();
}

/** My Stories */

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $myStories.empty();

  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $myStories.append($story);
  }

  $myStories.show();
}


/** Submit a new story */

async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const username = currentUser.username;
  const story = {title, author, url, username};

  const newStory = await storyList.addStory(currentUser, story);

  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);

  $createStoryForm.trigger("reset");
}

$createStoryForm.on("submit", submitStory);


/** Delete a new story */

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash", deleteStory);


/** Togle Favorite on/off */

async function toggleFavorite(evt) {
  console.debug("toggleFavorite");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($(evt.target).hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleFavorite);
