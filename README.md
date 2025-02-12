# Chevu - Modern Barber Booking Platform

(In Progress) Chevu is a streamlined web application that connects clients with professional barbers, making it easy to schedule and manage haircut appointments.

## Features

### For Clients
- **Browse Barbers**: View profiles, experience levels, and specialties of available barbers
- **Easy Scheduling**: Interactive calendar interface for selecting appointment times
- **Flexible Booking**: 30-minute time slots with real-time availability
- **Appointment Management**: View and manage your upcoming appointments

### For Barbers
- **Professional Dashboard**: Track and manage daily appointments
- **Calendar Management**: View scheduled appointments in a weekly/monthly format
- **Client Information**: Access customer details and appointment history
- **Availability Control**: Set and update working hours

## Tech Stack

- **Frontend**: Next.js 13 with TypeScript
- **UI Components**: React with Tailwind CSS
- **Calendar**: React Big Calendar
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **API**: Next.js API Routes



## Project Structure

```
chevu/
├── components/           # Reusable UI components
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── src/
    ├── app/             # Next.js 13 app directory
    │   ├── api/         # API routes
    │   ├── auth/        # Authentication pages
    │   └── barbers/     # Barber-related pages
    └── lib/             # Utility functions and configurations
```

## Key Features Implementation

### Appointment Scheduling
- Interactive calendar for time slot selection
- Real-time availability checking
- Automatic confirmation emails
- Conflict prevention system

### Barber Management
- Professional profile creation
- Service management
- Working hours configuration
- Appointment tracking

### User Experience
- Responsive design
- Intuitive booking flow
- Real-time updates
- Email notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- React Big Calendar for the calendar component
- All contributors who have helped shape Chevu

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
