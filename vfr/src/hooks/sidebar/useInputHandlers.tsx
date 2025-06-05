export const useInputHandlers = () => {
  const handleNumericInput = (value: string, callback: (num: number) => void) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      callback(num);
    }
  };

  return {
    handleNumericInput,
  };
};
