
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface TipAmountSelectorProps {
  amount: string;
  customAmount: string;
  onAmountChange: (value: string) => void;
  onCustomAmountChange: (value: string) => void;
}

export const TipAmountSelector = ({
  amount,
  customAmount,
  onAmountChange,
  onCustomAmountChange,
}: TipAmountSelectorProps) => {
  const predefinedAmounts = ["3", "5", "10"];

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium text-[#1A2B3B]">Amount</Label>
      <RadioGroup 
        value={amount}
        onValueChange={onAmountChange}
        className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {predefinedAmounts.map((value) => (
          <div key={value} className="flex items-center">
            <RadioGroupItem
              value={value}
              id={`amount-${value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`amount-${value}`}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 peer-data-[state=checked]:bg-[#FFD166] peer-data-[state=checked]:border-[#FFD166] peer-data-[state=checked]:text-[#2D3748] hover:border-[#FFD166] cursor-pointer transition-colors"
            >
              ${value}
            </Label>
          </div>
        ))}
        <div className="flex items-center">
          <RadioGroupItem
            value="custom"
            id="amount-custom"
            className="peer sr-only"
          />
         <Label
            htmlFor="amount-custom"
            className="flex h-12 w-full items-center justify-center rounded-lg border-2 peer-data-[state=checked]:border-[#FFD166] hover:border-[#FFD166] cursor-pointer transition-colors text-sm md:text-base px-2"
          >
            Custom
          </Label>

        </div>
      </RadioGroup>
      {amount === 'custom' && (
        <div className="mt-3">
          <Label htmlFor="customAmount" className="sr-only">Custom Amount</Label>
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              type="number"
              min="1"
              step="1"
              id="customAmount"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              placeholder="Enter amount"
              className="pl-7 w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
