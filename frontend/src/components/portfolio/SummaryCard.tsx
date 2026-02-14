import React from 'react'

interface SummaryCardProps {
  testId: string
  label: string
  value: string
  valueClassName?: string
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  testId,
  label,
  value,
  valueClassName = 'text-white'
}) => {
  return (
    <div data-testid={testId} className="bg-[#111827] rounded-xl p-6">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${valueClassName}`}>{value}</p>
    </div>
  )
}
