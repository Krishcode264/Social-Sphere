# Social Sphere

Social Sphere is a full-featured social media platform where users can connect with friends, share posts,
send messages, make audio and video calls, and receive notifications for important interactions. The app is
built using a modern web development stack with a focus on real-time communication, responsive design, and scalability.
[Watch the Demo Video](https://youtu.be/JfLvUZNR1N4?si=etmFEfb3rMAYxwQ3)

## Features

1. **User Authentication**
    - **Google OAuth**
    - **Credential-based Signup/Login**
    - **Email Verification System**
2. **User Profile Management**
    - **Profile View Tracking**
    - **Friend Requests and Management**
    - **Unfriend Option**
3. **Posts and Interactions**
    - **Create, Update, Delete Posts**
    - **Likes and Comments**
4. **Real-time Messaging System**
    - **One-on-one Conversations**
    - **Notifications for New Messages**
5. **Audio/Video Call Functionality**
6. **Notification System**
    - **Post-related Notifications (Likes, Comments)**
    - **Profile Views**
    - **Friend Request Notifications**
7. **Settings Page**
    - **Profile Visibility, Post Visibility**
    - **Dark Mode**
8. **Minimized Call Window**
    - **Allow ongoing calls in a minimized window**
9. **Post Photo Uploads**
    - **AWS S3 Integration**

## Technologies Used

- **Frontend:** Next.js (React), Tailwind CSS, Recoil (for state management)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Real-time Communication:** Socket.IO, WebRTC
- **Cloud Storage:** AWS S3
- **Authentication:** Google OAuth, Email-based verification (Nodemailer)
- **Caching/Optimization:** Redis (for socket ID management)

---

## Detailed Features and Implementations

### 1. User Authentication
**Google OAuth**  
- Implemented using `passport-google-oauth20` in the backend (Node.js, Express.js).
- Tokens are stored as HTTP-only cookies to maintain secure sessions.
- Technologies: Next.js, Node.js, Express.js, js-cookie for frontend cookie management.

**Credential-based Signup/Login**  
- Secure authentication using bcrypt for hashing passwords.
- Tokens are generated using JWT for session management.
- Email verification is implemented using Nodemailer to send verification links.

### 2. User Profile Management
**Profile View Tracking**  
- Tracks who viewed the user's profile and sends notifications.
- Technologies: MongoDB (for storing view logs), Socket.IO for real-time notifications.

**Friend Requests and Management**  
- Users can send, accept, and decline friend requests.
- Friendships are maintained via a friendship schema in MongoDB.
- Technologies: Express.js (API routes), MongoDB (friendship schema).

**Unfriend Option**  
- Allows users to unfriend someone they are connected with. The friendship document is deleted from the database.
- Technologies: Express.js, MongoDB.

### 3. Posts and Interactions
**Create, Update, Delete Posts**  
- Users can create posts with photos, edit captions, and delete posts.
- AWS S3 is used for storing images, and MongoDB stores post data.
- Technologies: AWS S3, MongoDB, Node.js, Express.js.

**Likes and Comments**  
- Users can like posts and comment on them.
- Real-time updates are sent to the post owner using Socket.IO.
- Technologies: MongoDB, Socket.IO.

### 4. Real-time Messaging System
**One-on-one Conversations**  
- Implemented using Socket.IO for real-time messaging and MongoDB to store conversations and messages.
- Conversations are loaded and displayed in a chat interface.

**Notifications for New Messages**  
- Real-time notifications are sent when new messages are received, even if the user is not on the chat screen.
- Technologies: Socket.IO, MongoDB, Recoil (for state management).

### 5. Audio/Video Call Functionality
- Audio and video call functionality is implemented using WebRTC for peer-to-peer connections.
- Calls are initiated using a socket event, and users can choose to accept or reject them.
- Technologies: WebRTC, Socket.IO, Next.js.

### 6. Notification System
**Post-related Notifications**  
- Users receive notifications when someone likes their post, comments on it, or views their profile.
- Real-time notifications are managed using Socket.IO and stored in MongoDB.
- Technologies: MongoDB, Socket.IO, Recoil (to manage notification state).

**Profile Views**  
- Users get notified when someone views their profile, providing engagement data.
- Technologies: MongoDB, Socket.IO.

**Friend Request Notifications**  
- Notifications are sent when users receive friend requests or when their request is accepted.
- Technologies: MongoDB, Socket.IO.

### 7. Settings Page
- Users can manage their profile and post visibility, enable/disable dark mode, and configure notification preferences.
- Technologies: React (Next.js), Recoil (for state management), Tailwind CSS.

### 8. Minimized Call Window
- Ongoing audio and video calls can be minimized, allowing users to continue browsing other parts of the app.
- The minimized window is implemented as an overlay, controlled by the state of the call.
- Technologies: WebRTC, React (Next.js).

### 9. Post Photo Uploads
- Users can upload photos with their posts, and these are stored in AWS S3.
- Pre-signed URLs are used for secure uploads directly to S3.
- Technologies: AWS S3, Node.js, Express.js, MongoDB (for storing post metadata).

---




## License

MIT License.

