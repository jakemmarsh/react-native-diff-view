type ConditionalStyleType<P> = [P, boolean];

export default function<P>(...args: (P | ConditionalStyleType<P> | undefined)[]): P {
  return args.reduce(
    (acc: P, value) => {
      if (Array.isArray(value) && value[1]) {
        return {
          ...acc,
          ...(value[0] || {}),
        };
      } else if (!Array.isArray(value)) {
        return {
          ...acc,
          ...(value || {}),
        };
      }

      return acc;
    },
    {} as P,
  );
}
