'use client';
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Video, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSession } from 'next-auth/react';
import { toast } from 'sonner';

const CounselorScheduling = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [meetingType, setMeetingType] = useState('video');
  const [session, setSession] = useState<any>(null);
  const counselors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Career Development & Planning',
      image: '/api/placeholder/64/64',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Professional Growth Strategy',
      image: '/api/placeholder/64/64',
    },
    {
      id: 3,
      name: 'Dr. Emily Williams',
      specialty: 'Resume Building & Interview Prep',
      image: '/api/placeholder/64/64',
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Industry Transition Guidance',
      image: '/api/placeholder/64/64',
    },
    {
      id: 5,
      name: 'Dr. Lisa Rodriguez',
      specialty: 'Leadership Development',
      image: '/api/placeholder/64/64',
    },
  ];

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  useEffect(() => {
    const fetchSession = async () => {
      const userSession = await getSession();
      setSession(userSession);
    };
    fetchSession();
  }, []);

  const handleSchedule = async () => {
    const selectedCounselorDetails = counselors.find(
      (c) => c.id === Number(selectedCounselor)
    );

    const meetingDetails = {
      email: session?.user?.email || '',
      counselorName: selectedCounselorDetails?.name,
      date: selectedDate,
      time: selectedTime,
      meetingType,
    };

    console.log('Meeting scheduled:', meetingDetails);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingDetails),
      });
      console.log(response);

      if (response.ok) {
        toast.success('Meeting scheduled successfully');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-white dark:bg-[#202434] dark:border-[#293040] border-[#E9ECF1] p-6 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto space-y-6 pb-6">
        <h1 className="text-3xl gap-2 flex font-bold mb-8 text-gray-900 dark:text-white">
          Schedule an Interview Practice Session
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="w-5 h-5 text-gray-900 dark:text-white" />
                <p>Select a Counselor</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {counselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedCounselor === counselor.id.toString()
                        ? 'bg-blue-200 dark:bg-blue-900 border-blue-300 dark:border-blue-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() =>
                      setSelectedCounselor(counselor.id.toString())
                    }
                  >
                    <div className="flex items-center gap-4">
                      <User className="text-gray-900 dark:text-white" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {counselor.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {counselor.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 text-gray-900 dark:text-white" />
                <p>Select a Date & Time</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        className={`p-2 rounded-lg text-sm transition-colors ${
                          selectedTime === time
                            ? 'bg-blue-200 dark:bg-blue-900 text-gray-900 dark:text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        <Clock className="w-4 h-4 inline-block mr-2" />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Meeting Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    meetingType === 'video'
                      ? 'bg-blue-200 dark:bg-blue-900 text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setMeetingType('video')}
                >
                  <Video className="w-6 h-6" />
                  <span>Video Call</span>
                </button>
                <button
                  className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    meetingType === 'chat'
                      ? 'bg-blue-200 dark:bg-blue-900 text-gray-900 dark:text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setMeetingType('chat')}
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>Chat Session</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-4">
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Selected Schedule
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Date: {selectedDate || 'Not selected'}</p>
                    <p>Time: {selectedTime || 'Not selected'}</p>
                    <p>
                      Counselor:{' '}
                      {counselors.find(
                        (c) => c.id === Number(selectedCounselor)
                      )?.name || 'Not selected'}
                    </p>
                    <p>
                      Type:{' '}
                      {meetingType === 'video' ? 'Video Call' : 'Chat Session'}
                    </p>
                  </div>
                </div>
                <button
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  disabled={
                    !selectedDate || !selectedTime || !selectedCounselor
                  }
                  onClick={handleSchedule}
                >
                  Schedule Meeting
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CounselorScheduling;
