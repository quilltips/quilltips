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
    <div className="space-y-2">
      <Label className="text-2xl font-semibold text-[#1A2B3B]">Choose Amount</Label>
      <RadioGroup 
        value={amount}
        onValueChange={onAmountChange}
        className="flex gap-3"
      >
        {predefinedAmounts.map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={value}
              id={`amount-${value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`amount-${value}`}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white hover:border-primary cursor-pointer transition-colors"
            >
              ${value}
            </Label>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="custom"
            id="amount-custom"
            className="peer sr-only"
          />
          <Label
            htmlFor="amount-custom"
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 peer-data-[state=checked]:border-primary hover:border-primary cursor-pointer transition-colors"
          >
            Other
          </Label>
        </div>
      </RadioGroup>
      {amount === 'custom' && (
        <Input
          type="number"
          min="1"
          step="1"
          value={customAmount}
          onChange={(e) => onCustomAmountChange(e.target.value)}
          placeholder="Enter amount"
          className="mt-2 w-32"
        />
      )}
    </div>
  );
};