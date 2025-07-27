
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

export const registerUser=createAsyncThunk(
    'auth/registerUser',
    async(userData,{rejectWithValue})=>{
    try {
        const response=await axiosClient.post('/user/register',userData); // it will send data to backend and will convert response into json
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message || "Something went wrong");

    }
})

export const loginUser=createAsyncThunk(
    'auth/loginUser',
    async(credentials,{rejectWithValue})=>{
    try {
        const response=await axiosClient.post('/user/login',credentials); // it will send data to backend and will convert response into json
        return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Something went wrong");

    }
}
)


export const checkAuth=createAsyncThunk(
    'auth/checkAuth',
    async(_, {rejectWithValue})=>{
        try {
            const {data}=await axiosClient.get('/user/check');
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || "Something went wrong");

        }
    }
)

export const logoutUser=createAsyncThunk(
    'auth/logoutUser',
    async(_, {rejectWithValue})=>{
        try {
            await axiosClient.post('/user/logout');
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || "Something went wrong");

        }
    }
)

const authSlice=createSlice({
    name:'auth',
    initialState:{
        user:null,
        isAuthenticated:false,
        loading:false,
        error:null
    },
    reducers:{
        
    },
    extraReducers:(builder)=>{
        builder
        //register user cases
        .addCase(registerUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload;
            state.user=action.payload;  // payload has response.data.user
        })
        .addCase(registerUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload || "Something went wrong";
            state.user=null;
            state.isAuthenticated=false;
        })

        // login user cases
        .addCase(loginUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload;
            state.user=action.payload;  // payload has response.data.user
        })
        .addCase(loginUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload || "Something went wrong";
            state.user=null;
            state.isAuthenticated=false;
        })

        // check auth cases
        .addCase(checkAuth.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(checkAuth.fulfilled,(state,action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload;
            state.user=action.payload;  // payload has response.data.user

        })
        .addCase(checkAuth.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload || "Something went wrong";
            state.user=null;
            state.isAuthenticated=false;
        })

        // logout user cases
        .addCase(logoutUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(logoutUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload;
            state.user=action.payload;  // payload has response.data.user
            state.error=null
        })
        .addCase(logoutUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload || "Something went wrong";
            state.user=null;
            state.isAuthenticated=false;
        })
    }
})


export default authSlice.reducer;