import React from 'react';
import { useParams } from 'react-router-dom';
import MatchDetail from '../components/MatchDetail';

const DetailView = () => {
  const { id } = useParams();

  return (
    <div>
      <MatchDetail />
    </div>
  );
};

export default DetailView;
