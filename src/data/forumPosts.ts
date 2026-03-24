export interface ForumPostData {
  author_name: string;
  author_avatar: string;
  title: string;
  category?: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  bookmarks: number;
}

const forumPosts: ForumPostData[] = [
  {
    author_name: "Stewart",
    author_avatar: "https://example.com/avatars/stewart.jpg",
    title: "7 Days Menu",
    category: "Healthy Recipes",
    image: "https://example.com/posts/7-days-menu.jpg",
    description:
      "Need inspiration so you don't get confused about what to cook every day? 🥗\nIn this forum, we can share ideas for healthy meals that are easy to prepare and delicious!",
    likes: 201,
    comments: 12,
    bookmarks: 10,
  },
  {
    author_name: "Felto",
    author_avatar: "https://example.com/avatars/felto.jpg",
    title: "Healthy LunchBox",
    category: "Lunchbox Ideas",
    image: "https://example.com/posts/healthy-lunchbox.jpg",
    description:
      "Simple and healthy lunchbox ideas for your busy weekdays! Pack your meals with balanced nutrition and great taste.",
    likes: 84,
    comments: 5,
    bookmarks: 7,
  },
];

export default forumPosts;
