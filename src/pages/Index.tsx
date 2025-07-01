import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Footprints, Building, Handshake } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <img 
            src="/RUNHUB white.png" 
            alt="RUNHUB" 
            className="h-8 w-auto"
          />
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
                Log in
              </Button>
            </Link>
            <Link to="/auth/user-type">
              <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                Connecting run clubs with{" "}
                <span className="text-primary">brands</span>
              </h1>
                              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                  RUNHUB LINK is the platform that brings running clubs and brands together for 
                  meaningful sponsorships and partnerships.
                </p>
              <div className="flex justify-center">
                <Link to="/auth/user-type">
                  <Button size="lg" className="group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Simple steps to connect and collaborate on the platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-primary-50 border-0 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Footprints className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Create Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Sign up as a running club or brand and build your profile to showcase your community or products.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary-50 border-0 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Browse Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Discover sponsorship opportunities that align with your club's values or create opportunities as a brand.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary-50 border-0 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Handshake className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Connect & Collaborate</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600">Apply to opportunities, manage applications, and build lasting partnerships between clubs and brands.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who It's For</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Built for running communities and brands looking to create meaningful partnerships
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardHeader className="bg-primary-50 pb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Footprints className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Running Clubs</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Create a profile to showcase your club and community</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Discover sponsorship opportunities from brands</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Apply for partnerships that match your club's values</span>
                    </li>
                  </ul>
                  <Link to="/auth/user-type">
                    <Button className="w-full group">
                      Join as a Run Club
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardHeader className="bg-primary-50 pb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Brands</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Create a brand profile to showcase your products</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Post sponsorship opportunities for running clubs</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Review applications and connect with the perfect club</span>
                    </li>
                  </ul>
                  <Link to="/auth/user-type">
                    <Button className="w-full group">
                      Join as a Brand
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img 
                src="/RUNHUB white.png" 
                alt="RUNHUB" 
                className="h-8 w-auto mb-4"
              />
              <p className="text-primary-foreground/80 leading-relaxed">
                Connecting running communities with brands for authentic partnerships.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Success Stories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
            <p className="text-primary-foreground/80">
              &copy; {new Date().getFullYear()} RUNHUB LINK. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
