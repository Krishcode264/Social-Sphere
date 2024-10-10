# Social Sphere

Social Sphere is a full-featured social media platform where users can connect with friends, share posts,
send messages, make audio and video calls, and receive notifications for important interactions. The app is
built using a modern web development stack with a focus on real-time communication, responsive design, and scalability.
[Watch the Demo Video](https://youtu.be/JfLvUZNR1N4?si=etmFEfb3rMAYxwQ3)

## Features
![home page](https://private-user-images.githubusercontent.com/114551368/375241249-a062c502-5269-418e-bad0-92aecadb421a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMjQ5LWEwNjJjNTAyLTUyNjktNDE4ZS1iYWQwLTkyYWVjYWRiNDIxYS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT03NTE2Mzc2YmFhMGJiMmMyOWZmNjFlNTk0YjlhOWYwOWYxMWRiMzE5MzRkNjk0MmE2ZmJlNThlNTQ5YjZmOGY3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.XLGMWvl1IUEGDHdBrGipFzR8VIAf9U3HSJ_s0O8VVww)

1. **User Authentication**
    - **Google OAuth**
    - **Credential-based Signup/Login**
    - **Email Verification System**
      ![google auth ](https://private-user-images.githubusercontent.com/114551368/375242235-58119e5a-a028-4e1f-b61a-ad1790ab5a28.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTc5MTEsIm5iZiI6MTcyODU1NzYxMSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQyMjM1LTU4MTE5ZTVhLWEwMjgtNGUxZi1iNjFhLWFkMTc5MGFiNWEyOC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMDUzMzFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wZmY4MTBlNzhiNmQ4ZjUzOGIxZGEyMzQ4Nzk3OWY2OGYzYzU0ODU2NzA1OTVkZjU3NmY2ZTljZjg3ZGFkMGRkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.QweswirZB7Uoswx805Mxc2M29KPjZBc4W5csNnmY-6A)

      ![signup page/login page](https://private-user-images.githubusercontent.com/114551368/375242242-6ad7fef9-9f8c-4f40-83d7-965a09229eb9.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTc5MTEsIm5iZiI6MTcyODU1NzYxMSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQyMjQyLTZhZDdmZWY5LTlmOGMtNGY0MC04M2Q3LTk2NWEwOTIyOWViOS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMDUzMzFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zNWY0NjkwN2VkZjlhNmJiY2I5ZmYyMWQyOGNmNmEzNTNiOWRiYzY2YjRhZjU3NTUyY2JkNzFlMjllMTEyNmI3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.6OILRIX-itrAYvhiHgAk5L0nK-8DbefHx_L2EDpjhZw)

![create account](https://private-user-images.githubusercontent.com/114551368/375242262-1ed6eedf-d9b2-4d41-bb9b-e96ffa9c3e6a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTc5MTEsIm5iZiI6MTcyODU1NzYxMSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQyMjYyLTFlZDZlZWRmLWQ5YjItNGQ0MS1iYjliLWU5NmZmYTljM2U2YS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMDUzMzFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0yNDJhZWUwMWNiNGI0Njk1MDI5MzA4ZmIxNDJlNmJhYmQ1YTE1MTBlMzA2MzY5ZWU0NGU3NjBiYjBhMTY0MGNmJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.lUB0H65HDBUAXnxHgJF37Wn5lZHcZC6-tVc8wRVbV2I)




      
2. **User Profile Management**
    - **Profile View Tracking**
  ![guest profile](https://private-user-images.githubusercontent.com/114551368/375348246-d3508303-101f-493d-995e-a6754851356b.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MzQ4MjQ2LWQzNTA4MzAzLTEwMWYtNDkzZC05OTVlLWE2NzU0ODUxMzU2Yi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zZTk3YTE3ZjEwYTZmYzQ0MDE4NTE4MjA4MGFkZDkzNWNmM2I3Y2Q4OTQ0MWI4NjM3NmIyMjJlYmIyNzA2MDc4JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.CSGNgFsBLNVgNfwQuqUNmGl3oFHzgxF3kgEBOEGOLOE)


![user profile](https://private-user-images.githubusercontent.com/114551368/375241213-f7428029-46bd-4849-b0e7-fcb8ff85c29a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMjEzLWY3NDI4MDI5LTQ2YmQtNDg0OS1iMGU3LWZjYjhmZjg1YzI5YS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT03NDlkNmU1MmFiM2U0NTY0NTllMjZkOTA1ZmFhNmM2OWQ0NWU0N2VkY2NlN2M2MzE3MGY1Y2FkZDMwY2RiZjY0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.72V33KsXJAA4nuHgu03X8-P9S5eHWHsN0VFo5YJvbx8)
    - **Friend Requests and Management**
    - **Unfriend Option**
  ![friend req management](https://private-user-images.githubusercontent.com/114551368/375241335-678962a1-5596-4db4-b773-f7e4ea599ba5.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMzM1LTY3ODk2MmExLTU1OTYtNGRiNC1iNzczLWY3ZTRlYTU5OWJhNS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mOTZmYzQ4MzI3NDk5MzhmNjkwOTkyY2Q0YzU5NTQ3Y2FlY2VjMjAxOWRmYjk1YTlmMTM3MTNkMGUxZTkyOGFiJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.UTfMiJi9J2ZjoRoPucNaVJCktWxHxdyN8Xs1KRSZVZ0)
    
3. **Posts and Interactions**
    - **Create, Update, Delete Posts**
    - **Likes and Comments**
  ![post ](https://private-user-images.githubusercontent.com/114551368/375242215-d6f0be11-30ab-4974-997d-7b3d9c472ad6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQyMjE1LWQ2ZjBiZTExLTMwYWItNDk3NC05OTdkLTdiM2Q5YzQ3MmFkNi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hOGQzZDQzYzQ4YmZiNTdlNTcxN2QwYmZmYWNlNzdjZjk4YzZkM2ZjNDkyMTEwYmJlYWZlYzc3MmRiZjUxMWJkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.PnasgN-Gg5gfJKmuf5a7P4I89HEtZt02p3stUNGo1W0)

4. **Real-time Messaging System**
    - **One-on-one Conversations**
    - **Notifications for New Messages**

![message_systemdesign](https://private-user-images.githubusercontent.com/114551368/375348264-0d90b017-cde5-4823-bab7-a39fdfcc92ac.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MzQ4MjY0LTBkOTBiMDE3LWNkZTUtNDgyMy1iYWI3LWEzOWZkZmNjOTJhYy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT01NTE5MWQ2ZDk4MWE2YmJhZTExMDc2MGIyZTEzNWE2MWU1M2EzNTNmZDFhOTA3NzA0Yjc2MzZmNzFiYWY5MDRmJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.uWoz8klj-Bo1fl5xYPFxTrnHk_yGeCveCkOl_wnKgXo)
![file sharing within messages](https://private-user-images.githubusercontent.com/114551368/375242281-ce8344ad-0147-4598-a49c-181eb6d9c677.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTc5MTEsIm5iZiI6MTcyODU1NzYxMSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQyMjgxLWNlODM0NGFkLTAxNDctNDU5OC1hNDljLTE4MWViNmQ5YzY3Ny5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMDUzMzFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02MTRlYzBkMzFhYWM5YTQzOGZiYmE4ZDg4YzgzZmY2Y2M0NWE4NTgzOWEwYzY1ZTlhNTA5MDczMDgzYzIyODYwJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.ZldAAxlQpdr4q1DlyuiJ4HxNMbG-TfE4GiMZRSco7s8)


![ui for messages](https://private-user-images.githubusercontent.com/114551368/375348259-c21f2e61-4009-4665-8a4e-926f766ba5c9.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MzQ4MjU5LWMyMWYyZTYxLTQwMDktNDY2NS04YTRlLTkyNmY3NjZiYTVjOS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00NmI5YmU2NWIxZDMxNWI3NzhiOTk0Yjc1YWVmMzViNTY2ZTkwMDcwYTVhODJkMTMwYWU5OGE0MzBjODhiNGViJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.nzWTYl8Uta7hujsAYnlhgxIAGEEj3YzLLlQ_Q-35wg0)

![multiple files](https://private-user-images.githubusercontent.com/114551368/375348254-14c73c1f-b6e4-4c9d-8e94-26c1209800a6.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MzQ4MjU0LTE0YzczYzFmLWI2ZTQtNGM5ZC04ZTk0LTI2YzEyMDk4MDBhNi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00Yjg5YmY2NGYzNTQzNmI4OWI2ZDQxYjQ3ODU0YjlhYjE0NThmYzcyZTJjN2RlMzlmZTRkZWM5NTQwZWJhNWI2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.cZd36QhAmThEhj-YU7oTGgZyhf0BpegHLe0XvATueAE)
5. **Audio/Video Call Functionality**


![audio video caLL](https://private-user-images.githubusercontent.com/114551368/375241376-6c9158f9-146e-4b7e-abf0-50072c2f3161.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMzc2LTZjOTE1OGY5LTE0NmUtNGI3ZS1hYmYwLTUwMDcyYzJmMzE2MS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1lMjZkOTY4M2VmMzYzYzhiMGIzOTIzMGFjNmI5OTBmMGExMDA3NDU1NWY5NzdmYTI5N2MwNTMwZTM0ZjVkZDhhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.l_NbyhL3kUiC34ohYhiqz_1PzKgrGX83KoH0oOA4GkY)

![popup call vindow](https://private-user-images.githubusercontent.com/114551368/375241389-8db79602-d689-44df-b878-8634cb7113ed.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMzg5LThkYjc5NjAyLWQ2ODktNDRkZi1iODc4LTg2MzRjYjcxMTNlZC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mZWIwNTlkNDY5MTFhM2FjODQ4OTAyMDY3MjU1MzMzNDNiMWI5OGE1YjUwMmNhMWI0YjNmNDA0YmY5Yjg3MTZhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.mCBj51kaQuaJvlLa5xrxODMHBluo1TzrrdBgoQQd7ZI)

6. **Notification System**
    - **Post-related Notifications (Likes, Comments)**
    - **Profile Views**
    - **Friend Request Notifications**
  
    ![notification](https://private-user-images.githubusercontent.com/114551368/375241249-a062c502-5269-418e-bad0-92aecadb421a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMjQ5LWEwNjJjNTAyLTUyNjktNDE4ZS1iYWQwLTkyYWVjYWRiNDIxYS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT03NTE2Mzc2YmFhMGJiMmMyOWZmNjFlNTk0YjlhOWYwOWYxMWRiMzE5MzRkNjk0MmE2ZmJlNThlNTQ5YjZmOGY3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.XLGMWvl1IUEGDHdBrGipFzR8VIAf9U3HSJ_s0O8VVww)
7. **Settings Page**
    - **Profile Visibility, Post Visibility**
    - **Dark Mode**
8. **Minimized Call Window**
    - **Allow ongoing calls in a minimized window**
  
    - ![minimised call window](https://private-user-images.githubusercontent.com/114551368/375241389-8db79602-d689-44df-b878-8634cb7113ed.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMzg5LThkYjc5NjAyLWQ2ODktNDRkZi1iODc4LTg2MzRjYjcxMTNlZC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mZWIwNTlkNDY5MTFhM2FjODQ4OTAyMDY3MjU1MzMzNDNiMWI5OGE1YjUwMmNhMWI0YjNmNDA0YmY5Yjg3MTZhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.mCBj51kaQuaJvlLa5xrxODMHBluo1TzrrdBgoQQd7ZI)
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
![post upload](https://private-user-images.githubusercontent.com/114551368/375241213-f7428029-46bd-4849-b0e7-fcb8ff85c29a.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mjg1NTg2NjksIm5iZiI6MTcyODU1ODM2OSwicGF0aCI6Ii8xMTQ1NTEzNjgvMzc1MjQxMjEzLWY3NDI4MDI5LTQ2YmQtNDg0OS1iMGU3LWZjYjhmZjg1YzI5YS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMDEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTAxMFQxMTA2MDlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT03NDlkNmU1MmFiM2U0NTY0NTllMjZkOTA1ZmFhNmM2OWQ0NWU0N2VkY2NlN2M2MzE3MGY1Y2FkZDMwY2RiZjY0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.72V33KsXJAA4nuHgu03X8-P9S5eHWHsN0VFo5YJvbx8)
---

## Detailed Features and Implementations

### 1. User Authentication
**Google OAuth**  
- Implemented by manual google  auth login  (Node.js, Express.js).
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

