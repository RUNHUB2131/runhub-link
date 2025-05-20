-- Enable RLS on chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read chats they are part of
CREATE POLICY "Users can read their own chats"
ON public.chats
FOR SELECT
TO authenticated
USING (
  brand_id = auth.uid() OR 
  run_club_id = auth.uid()
);

-- Create policy to allow users to insert chats
CREATE POLICY "Users can insert chats"
ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (
  brand_id = auth.uid() OR 
  run_club_id = auth.uid()
);

-- Create policy to allow users to update their own chats
CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
TO authenticated
USING (
  brand_id = auth.uid() OR 
  run_club_id = auth.uid()
);

-- Enable RLS on chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read messages in their chats
CREATE POLICY "Users can read messages in their chats"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.brand_id = auth.uid() OR chats.run_club_id = auth.uid())
  )
);

-- Create policy to allow users to insert messages in their chats
CREATE POLICY "Users can insert messages in their chats"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.brand_id = auth.uid() OR chats.run_club_id = auth.uid())
  )
);

-- Create policy to allow users to update messages in their chats
CREATE POLICY "Users can update messages in their chats"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.brand_id = auth.uid() OR chats.run_club_id = auth.uid())
  )
); 