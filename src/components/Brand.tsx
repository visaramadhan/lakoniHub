"use client";

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import logoLight from '@/app/assets/logotype-green.png';
import logoDark from '@/app/assets/logotype-white.png';

type BrandTone = 'light' | 'dark';

export default function Brand({
  href = '/',
  tone = 'light',
  className,
  imageClassName,
  showText = false,
}: {
  href?: string;
  tone?: BrandTone;
  className?: string;
  imageClassName?: string;
  showText?: boolean;
}) {
  const logo = tone === 'dark' ? logoDark : logoLight;

  return (
    <Link href={href} className={cn('flex items-center gap-3', className)}>
      <Image
        src={logo}
        alt="ProsesinHub"
        className={cn('h-8 w-auto', imageClassName)}
        priority
      />
      {showText && (
        <span className={cn('font-bold text-xl', tone === 'dark' ? 'text-white' : 'text-primary')}>
          ProsesinHub
        </span>
      )}
    </Link>
  );
}
