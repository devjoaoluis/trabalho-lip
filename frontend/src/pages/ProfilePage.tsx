import { ProfilePage as ProfilePageComponent } from "#components/profile/ProfilePage"
import { Sidebar } from "#components/layout/Sidebar"
import "./dashboard.css"


export default function ProfilePage() {
  return (
    <div className="dashboard-page">
        <Sidebar />
        <ProfilePageComponent />
    </div>
  )
}



