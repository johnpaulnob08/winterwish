import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Snowfall from './components/Snowfall'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import FindGroup from './pages/FindGroup'
import GroupAccess from './pages/GroupAccess'
import GroupGate from './pages/GroupGate'
import GroupDashboard from './pages/GroupDashboard'
import MemberWishlist from './pages/MemberWishlist'
import { Privacy, Terms, NotFound } from './pages/Simple'
import AdminLayout, { AdminRoot } from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import AdminOverview from './pages/admin/Overview'
import AdminGroups from './pages/admin/Groups'
import CreateGroup from './pages/admin/CreateGroup'
import GroupDetail from './pages/admin/GroupDetail'
import GroupMembers from './pages/admin/GroupMembers'
import WishlistEditor from './pages/admin/WishlistEditor'
import MembersAndWishlists from './pages/admin/MembersAndWishlists'
import AdminSettings from './pages/admin/Settings'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const inAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <>
      {!inAdmin && <Snowfall />}
      <div className="relative z-10 flex min-h-screen flex-col">
        {!inAdmin && <Navbar />}
        <ScrollManager />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/find-group" element={<FindGroup />} />
            <Route path="/group/:groupCode">
              <Route index element={<GroupAccess />} />
              <Route element={<GroupGate />}>
                <Route path="dashboard" element={<GroupDashboard />} />
                <Route path="member/:memberId" element={<MemberWishlist />} />
              </Route>
            </Route>
            <Route path="/admin" element={<AdminRoot />}>
              <Route path="login" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="groups" element={<AdminGroups />} />
                <Route path="groups/create" element={<CreateGroup />} />
                <Route path="groups/:groupId" element={<GroupDetail />} />
                <Route path="groups/:groupId/members" element={<GroupMembers />} />
                <Route path="groups/:groupId/members/:memberId" element={<WishlistEditor />} />
                <Route path="members" element={<MembersAndWishlists />} />
                <Route path="archived" element={<AdminGroups archived />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>            
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {!inAdmin && <Footer />}
      </div>
    </>
  )
}
