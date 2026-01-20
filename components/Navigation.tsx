"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navigation = [
    { name: 'Home', href: '/' },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <header className="fixed w-full z-10 border-b border-border">
            <div className="bg-background/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">

                        <h1 className="text-sm font-medium bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Cardano Governance
                        </h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        <nav className="flex space-x-6">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
