import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-8 text-center">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <p className="text-sm text-neutral-400">
                    <span>© {currentYear} TrendSpark. All rights reserved.</span>

                    <span className="mx-2">|</span>

                    <span>
                        Crafted by{' '}
                        <a
                            href="https://github.com/Mbareck21"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-red-300 hover:text-red-200 transition-colors duration-200"
                        >
                            MOHAMED MBARECK
                        </a>
                    </span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;