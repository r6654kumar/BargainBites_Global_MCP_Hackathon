import React from 'react';
import { Descope } from '@descope/react-sdk';

const Login = ({ flowId = 'sign-up-or-in-passwords-or-social' }) => {
  return (
    <div className="p-4">
      <Descope
        flowId={flowId}
        onSuccess={(e) => console.log('login success -> user:', e.detail.user)}
        onError={(e) => console.error('login failed', e)}
      />
    </div>
  );
};

export default Login;
