export const useInputHandlers = () => {
  const handleNumericInput = (value: string | undefined, callback: (num: number) => void) => {
    if (value === undefined || value === '') {
      callback(0);
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      callback(num);
    } else {
      callback(0);
    }
  };

  return {
    handleNumericInput,
  };
};
