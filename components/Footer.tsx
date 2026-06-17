import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-8 text-center">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>© {currentYear} TrendSpark. All rights reserved.</span>

                    <span className="mx-2 opacity-50">|</span>

                    <span>
                        Crafted by{' '}
                        <a
                            href="https://github.com/Mbareck21"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium transition-opacity duration-200 hover:opacity-80"
                            style={{ color: 'rgb(var(--accent))' }}
                        >
                            LEMINE MBARECK
                        </a>
                    </span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;