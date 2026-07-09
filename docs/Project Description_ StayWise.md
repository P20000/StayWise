## StayWise.ai: Smart Hotel Booking Platform [URL 🔗](http://staywise.ai)

## 📔Guidelines for StayWise.ai: Smart Hotel Booking Platform

The StayWise.ai is a responsive web-based platform that simulates a real-world hotel reservation experience similar to applications like Booking.com or OYO. It allows users to search for hotels, check availability, make bookings, and complete secure online payments. In parallel, hotel managers (admins) can manage hotel listings, update room availability, monitor bookings, and set dynamic pricing. This project is built using full-stack development practices and integrates external services for payment processing and secure user interactions.

## 💡 Core Features

- Role-based access (Customer, Admin)

- Secure online payments via Stripe or Razorpay

- Real-time availability and dynamic pricing

- Booking management and confirmation emails

- Admin dashboard for managing rooms, availability, and bookings

- Search filters and hotel detail views

- File uploads for room images

- Booking confirmation and status tracking

## SmartStay Recommender (AI Feature)

The SmartStay Recommender is an AI-powered recommendation engine that suggests personalized hotels to users based on their previous searches, booking history, location preferences, and seasonal trends. It enhances user engagement by reducing the time needed to find suitable accommodations.


## 🎭 Actors and Roles

## 👤 Customer (Guest)

Customers can browse hotels using a responsive search interface, filter results based on various criteria, and view detailed room information. They can select their desired dates, provide booking details, and pay securely through an integrated payment gateway. After a successful transaction, customers receive a booking confirmation with all necessary details and reference information.

## 🧑🏫 Admin (Hotel Manager)

Admins have access to a comprehensive dashboard where they can manage hotel listings, add or edit room details, upload images, set availability, and monitor bookings. Admins can also cancel or modify bookings and view key metrics such as revenue and booking status. All administrative actions are secured and accessible only through admin login.

## 🛠️Tools and Technologies to be used

## Layer

Frontend

State Management

Backend

Database

Authentication

File Handling/Uploading

Payment Gateway

Deployment

## Technologies

React.js, Tailwind CSS, axios [URL 🔗](http://react.js)

Context API / Redux Toolkit

Node.js, Express.js [URL 🔗](http://express.js)

MongoDB or MySQL

Email & Password (Admin), OTP (optional)

Multer (file upload package)

Stripe API or Razorpay API

Render, Vercel, Heroku, AWS (any one)


## 📄 Required Web Pages and Features

## Landing Page

The landing page, accessible at the root URL ("/"), serves as the main entry point for users. It features a responsive hotel search bar that allows users to enter a destination, select check-in and check-out dates, choose the number of guests, and initiate a search via the "Search" button. Just below the search bar, the SmartStay Recommender section uses AI to display personalized hotel suggestions based on the user's preferences, previous activity, and trending destinations. This helps users quickly find accommodations tailored to their needs. Further down, a Featured Hotels section showcases popular or top-rated listings, ensuring both new and returning users enjoy a smart, intuitive, and efficient hotel search experience right from the start.

## Search Results Page

The Search Results Page, accessible at "/search-results", displays hotels based on the user's search criteria. It includes filter options such as location, price range, room type, and amenities, allowing users to refine their results. Each hotel is presented in a card format, showing an image, hotel name, rating, price per night, and a "Book Now" button for quick access to the booking process. This layout helps users compare options efficiently and make informed booking decisions.

## Hotel Detail Page

The Hotel Detail Page, accessible at "/hotel/:id", provides detailed information about a selected hotel. It features a gallery of images, room descriptions, and a list of amenities


or features. Users can select check-in and check-out dates to check availability. The page displays the price per night clearly and includes a "Book Room" button to initiate the booking process. This layout ensures users have all the necessary information to make a booking decision confidently.

## Booking Page

The Booking Page, accessible at "/booking/:hotelId", allows users to complete their reservation. It includes a booking form with fields for name, email, phone number, check-in and check-out dates, and number of guests. A detailed price breakdown is displayed along with the total cost. The "Pay Now" button redirects users to the payment gateway to finalize the booking. This page ensures a smooth and transparent booking process.

## Payment Integration

The Payment Page, accessible at "/payment", handles secure transactions through Stripe or Razorpay. It supports card input and UPI as payment methods. Upon completion, users are redirected to either a success or failure page based on the transaction outcome. All transaction details are securely stored in the database for record-keeping and future reference.

## Booking Confirmation Page

The Booking Confirmation Page (/booking/confirmation) provides users with a clear summary of their booking details. It displays the booking ID, the amount paid, check-in and check-out dates, and information about the reserved room. Additionally, the page confirms that a booking confirmation email has been sent to the user.

## Admin Login Page


The Admin Login Page (/admin/login) allows administrators to securely access the system by entering their email and password. Upon successful authentication, users are redirected to the admin dashboard at /admin/dashboard.

## Admin Dashboard

The Admin Dashboard (/admin/dashboard) provides a high-level overview of key metrics through summary cards displaying total bookings, revenue, and available rooms. It also includes a sidebar navigation menu that allows administrators to manage rooms and bookings efficiently.

## Manage Rooms Page

The Manage Rooms Page (/admin/rooms) enables administrators to add, edit, or delete room listings. It provides functionality to upload room images, set base pricing, and manage room availability through an interactive calendar interface.

## Manage Bookings Page

The Manage Bookings Page (/admin/bookings) allows administrators to view, filter, and manage all bookings. Bookings can be sorted by date, customer name, or status. Admins can cancel or update bookings as needed and view corresponding payment statuses for each reservation.


🚩Project Learning Objectives:

- Develop role-based access systems

- Integrate secure payment gateways (Stripe/Razorpay)

- Handle file uploads and media management

- Create RESTful APIs for dynamic operations

- Design modern UIs with real-world use cases

- Build responsive and mobile-friendly applications

- Deploy full-stack applications to production

- Implement basic AI-driven personalization features (e.g., hotel recommendations using SmartStay Recommender)
