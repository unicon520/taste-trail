const restaurants = [
  {
    id: "1",
    name: "Midnight Noodle House",
    location: "Downtown",
    cuisine: "Japanese",
    rating: 4.8,
    reviews: [
      { id: "r1", user: "Alex", rating: 5, comment: "Best ramen in the city. The broth is legendary." },
      { id: "r2", user: "Sam", rating: 4.5, comment: "Great vibe, gets crowded after 11 PM." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "2",
    name: "Taco Cielo",
    location: "Westside",
    cuisine: "Mexican",
    rating: 4.2,
    reviews: [
      { id: "r3", user: "Jordan", rating: 4, comment: "Al pastor tacos are amazing." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "3",
    name: "The Rustic Slice",
    location: "North End",
    cuisine: "Pizza",
    rating: 3.5,
    reviews: [],
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
  }
];

module.exports = {
  getRestaurants: () => restaurants,
  addRestaurant: (rest) => {
    const newRest = { 
      id: Date.now().toString(), 
      reviews: [], 
      rating: rest.rating || 0,
      ...rest 
    };
    restaurants.push(newRest);
    return newRest;
  },
  addReview: (restaurantId, review) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return null;

    const newReview = { id: Date.now().toString(), ...review };
    restaurant.reviews.push(newReview);
    
    // Recalculate average rating
    const totalRating = restaurant.reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    restaurant.rating = (totalRating / restaurant.reviews.length).toFixed(1);
    
    return restaurant;
  }
};
