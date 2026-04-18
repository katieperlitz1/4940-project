import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserSelect from './pages/UserSelect'
import Feed from './pages/Feed'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSelect />} />
        <Route path="/feed/:userId" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  )
}
