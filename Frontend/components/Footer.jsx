// File: src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-purple-900 text-white py-8 px-6 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="text-lg font-semibold mb-2">About</h4>
          <p>This is an ICT project developed by 3rd year students of the Faculty of Technology, University of Sri Jayewardenepura.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Contact</h4>
          <p>Email: moodmirror@sjp.ac.lk</p>
          <p>Phone: +94 11 2758000</p>
          <p>Address: Faculty of Technology, Pitipana, Homagama</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Resources</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-yellow-300">Help</a></li>
            <li><a href="#" className="hover:text-yellow-300">Community</a></li>
            <li><a href="#" className="hover:text-yellow-300">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-yellow-300">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Info</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-yellow-300">Support</a></li>
            <li><a href="#" className="hover:text-yellow-300">FAQs</a></li>
            <li><a href="#" className="hover:text-yellow-300">Feedback</a></li>
            <li><a href="#" className="hover:text-yellow-300">Report an Issue</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-6 border-t border-purple-700 pt-4">
        &copy; {new Date().getFullYear()} MoodMirror. All rights reserved.
      </div>
    </footer>
  );
}