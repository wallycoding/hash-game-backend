type TypePositions = ("one" | "two" | null)[];

export const verifyPositions = (positions: TypePositions) => {
  const checkByOrder = (orderedPositions: TypePositions) => {
    for (const item of orderedPositions) if (item === undefined) return null;
    return orderedPositions.reduce((acumulator, current) =>
      acumulator === current ? acumulator : null
    );
  };
  const verifyHorizontal = () => {
    for (let i = 0; i < 3; i++) {
      const orderedPositions = positions.slice(i * 3, i * 3 + 3);
      const check = checkByOrder(orderedPositions);
      if (check) return check;
    }
    return null;
  };

  const verifyVertical = () => {
    for (let i = 0; i < 3; i++) {
      const orderedPositions = [
        positions[i],
        positions[i + 3],
        positions[i + 6],
      ];
      const check = checkByOrder(orderedPositions);
      if (check) return check;
    }
    return null;
  };

  const verifyDiagonal = () => {
    const topToBottom = [positions[0], positions[4], positions[9]];
    const bottomToTop = [positions[2], positions[4], positions[6]];
    const axes = [topToBottom, bottomToTop];
    for (const orderedPositions of axes) {
      const check = checkByOrder(orderedPositions);
      if (check) return check;
    }
    return null;
  };

  console.log("HORIZONTAL:", verifyHorizontal());
  console.log("VERTICAL:", verifyVertical());
  console.log("DIAGONAL", verifyDiagonal());

  const verification = {
    horizontal: verifyHorizontal(),
    vertical: verifyVertical(),
    diagonal: verifyDiagonal(),
    get hasWin() {
      return (
        verification.horizontal ||
        verification.vertical ||
        verification.diagonal
      );
    },
  };

  return verification;
};