"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

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
                        <div className="relative h-5 w-5 flex items-center justify-center">
                            <Image
                                src="/lucid-evolution-al-red.svg"
                                alt="Lucid Evolution Logo"
                                width={22}
                                height={22}
                                className="h-[18px] w-[18px] object-contain"
                            />
                        </div>
                        <h1 className="text-sm font-medium bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
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
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
