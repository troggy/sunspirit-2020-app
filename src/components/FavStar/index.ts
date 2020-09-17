import styled from "styled-components";

const FavStar = styled.span`
  display: inline-block;
  height: 12px;
  width: 12px;
  color: gold;

  & > svg {
    height: 100%;
    width: 100%;
  }
`;

export default FavStar;
