"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail, FileText, Users, Settings } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <HelpPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function HelpPageContent() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("getting-started")

  const categories = [
    { id: "getting-started", label: "Getting Started", icon: Book },
    { id: "account", label: "Account & Profile", icon: Users },
    { id: "tasks", label: "Tasks & Projects", icon: FileText },
    { id: "attendance", label: "Attendance", icon: Phone },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "contact", label: "Contact Support", icon: MessageCircle }
  ]

  const faqs = {
    "getting-started": [
      {
        question: "How do I get started with Infinitum CRM?",
        answer: "Welcome to Infinitum CRM! Start by completing your profile, then explore your dashboard based on your role. Admins can manage employees, while employees can track tasks and attendance."
      },
      {
        question: "What are the different user roles?",
        answer: "There are three main roles: Admin (full system access), Project Manager (team and task management), and Employee (personal tasks and attendance)."
      },
      {
        question: "How do I navigate the system?",
        answer: "Use the sidebar to access different sections. Your available options depend on your role and permissions."
      }
    ],
    "account": [
      {
        question: "How do I update my profile?",
        answer: "Go to Profile in the sidebar, then click Edit Profile. You can update your personal information, contact details, and preferences."
      },
      {
        question: "How do I change my password?",
        answer: "Navigate to Settings > Security, then click 'Change Password'. Enter your current password and choose a new secure password."
      },
      {
        question: "How do I change my notification preferences?",
        answer: "Go to Settings > Notifications to customize email, push, and SMS notifications according to your preferences."
      }
    ],
    "tasks": [
      {
        question: "How do I create a new task?",
        answer: "Admins and Project Managers can create tasks from the Tasks page. Click 'Create Task', fill in the details, and assign it to an employee."
      },
      {
        question: "How do I start working on a task?",
        answer: "Go to your assigned tasks, click the 'Start Timer' button to begin time tracking, and 'Stop Timer' when you're done."
      },
      {
        question: "How do I mark a task as completed?",
        answer: "When working on a task, click the 'Mark Complete' button. This will stop time tracking and notify relevant stakeholders."
      }
    ],
    "attendance": [
      {
        question: "How do I check in/out?",
        answer: "Go to Attendance in the sidebar. Click 'Check In' when you start work and 'Check Out' when you finish. The system tracks your hours automatically."
      },
      {
        question: "What if I'm late or leave early?",
        answer: "The system automatically detects late check-ins and early check-outs. These are recorded in your attendance history for transparency."
      },
      {
        question: "How do I view my attendance history?",
        answer: "Visit the Attendance page to see your complete attendance history, including hours worked and any overtime."
      }
    ],
    "settings": [
      {
        question: "How do I change the theme?",
        answer: "Go to Settings > Appearance and choose between Light, Dark, or System theme preferences."
      },
      {
        question: "How do I change my language?",
        answer: "Navigate to Settings > Preferences and select your preferred language from the dropdown menu."
      },
      {
        question: "How do I enable two-factor authentication?",
        answer: "Visit Settings > Security and click 'Enable 2FA' to add an extra layer of security to your account."
      }
    ],
    "contact": [
      {
        question: "How do I contact support?",
        answer: "You can reach our support team through the contact form below, or email us directly at support@infinitumcrm.com."
      },
      {
        question: "What are your support hours?",
        answer: "Our support team is available Monday through Friday, 9 AM to 6 PM in your local timezone."
      }
    ]
  }

  const filteredFaqs = faqs[activeCategory]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">Help Center</h1>
          <p className="text-muted-foreground mt-2">Find answers to common questions and get support</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}

              {filteredFaqs.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              )}

              {activeCategory === "contact" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">Contact Support</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Email Support</p>
                          <p className="text-sm text-muted-foreground">support@infinitumcrm.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Phone Support</p>
                          <p className="text-sm text-muted-foreground">1-800-INF-CRM</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                        <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                          <option>General Inquiry</option>
                          <option>Technical Support</option>
                          <option>Feature Request</option>
                          <option>Bug Report</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                        <textarea
                          rows={4}
                          placeholder="Describe your issue or question..."
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        ></textarea>
                      </div>
                      <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#" className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <Book className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">User Guide</p>
                <p className="text-sm text-muted-foreground">Complete documentation</p>
              </div>
            </a>

            <a href="#" className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Community Forum</p>
                <p className="text-sm text-muted-foreground">Connect with other users</p>
              </div>
            </a>

            <a href="#" className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">API Documentation</p>
                <p className="text-sm text-muted-foreground">Developer resources</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}