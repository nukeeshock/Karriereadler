'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import Link from 'next/link';

interface WiderrufsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function WiderrufsCheckbox({ checked, onChange }: WiderrufsCheckboxProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 space-y-4">
      {/* Legal Notice Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Info className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            Widerrufsbelehrung bei digitalen Dienstleistungen
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Mit deiner Bestellung verlangst du ausdrücklich, dass wir <strong>vor Ablauf der gesetzlichen Widerrufsfrist</strong> mit der Ausführung der Dienstleistung beginnen.
            </p>
            <p>
              Dir ist bekannt, dass dein gesetzliches <strong>Widerrufsrecht erlischt</strong>, sobald die Dienstleistung vollständig erbracht wurde (z.B. wenn du deine finalen Bewerbungsunterlagen erhalten hast).
            </p>
            <p className="text-xs text-gray-600 mt-3">
              Ausführliche Informationen findest du in unserer{' '}
              <Link href="/widerrufsbelehrung" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                Widerrufsbelehrung
              </Link>{' '}
              und unseren{' '}
              <Link href="/agb" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                AGB
              </Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Required Checkbox */}
      <div className="pt-4 border-t-2 border-orange-200">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex-shrink-0 pt-0.5">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-orange-400 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer transition-all"
              required
            />
          </div>
          <span className="text-sm text-gray-900 font-medium group-hover:text-orange-700 transition-colors">
            Ich stimme zu, dass Karriereadler vor Ablauf der Widerrufsfrist mit der Ausführung beginnt, und ich mein Widerrufsrecht mit vollständiger Leistungserbringung verliere.
          </span>
        </label>
      </div>
    </div>
  );
}
