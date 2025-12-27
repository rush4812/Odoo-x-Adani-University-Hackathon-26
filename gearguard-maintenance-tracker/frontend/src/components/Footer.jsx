import React from 'react'

export default function Footer(){
  const year = new Date().getFullYear()
  return (
    <footer className="app-footer bg-dark text-light mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="small">&copy; {year} GearGuard — All rights reserved.</div>
        <div className="small text-muted">Built for Reliability • Crafted with care</div>
      </div>
    </footer>
  )
}
