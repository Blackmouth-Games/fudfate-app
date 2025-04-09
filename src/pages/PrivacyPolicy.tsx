
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-pixel gold-text mb-8 text-center">Privacy Policy</h1>
          
          <div className="prose prose-lg mx-auto">
            <p>Last updated: April 9, 2025</p>
            
            <h2 className="text-xl font-pixel mt-6 mb-3">1. Introduction</h2>
            <p>
              Welcome to FUDFate ("we," "our," or "us"). We respect your privacy and are committed to 
              protecting your personal data. This privacy policy will inform you about how we look after 
              your personal data when you visit our website and tell you about your privacy rights and 
              how the law protects you.
            </p>
            
            <h2 className="text-xl font-pixel mt-6 mb-3">2. Data We Collect</h2>
            <p>
              When you use our application, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Wallet addresses</li>
              <li>Transaction data</li>
              <li>Usage statistics</li>
              <li>Device information</li>
            </ul>
            
            <h2 className="text-xl font-pixel mt-6 mb-3">3. How We Use Your Data</h2>
            <p>
              We use the collected data for various purposes:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
            
            <h2 className="text-xl font-pixel mt-6 mb-3">4. Data Security</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over 
              the Internet or method of electronic storage is 100% secure. While we strive to use commercially 
              acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
            
            <h2 className="text-xl font-pixel mt-6 mb-3">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>By visiting our website: <a href="https://blackmouthgames.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://blackmouthgames.com</a></li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
