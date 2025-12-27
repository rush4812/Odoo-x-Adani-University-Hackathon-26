import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
export default function Layout(){
  return (
    <div className="app-root d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-shrink-0 mt-4 mb-4">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
