import React from 'react';
import { Briefcase } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-black/30 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center mb-8">
          <Briefcase className="w-8 h-8 text-purple-400" />
          <span className="ml-2 text-xl font-bold text-white">
            JobFlow AI for Talent Corner H.R. Services Pvt. Ltd.
          </span>
        </div>
        <div className="flex justify-center mb-4">
          <img
            src="https://media.licdn.com/dms/image/v2/C4D0BAQGMMu3jONWkfA/company-logo_200_200/company-logo_200_200/0/1631310508235?e=2147483647&v=beta&t=VYlO-VXuV1HiPcg6xxfPvZYZTHWlSTw70PUg8y972Go"
            alt="Talent Corner Logo"
            className="w-16 h-16"
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
