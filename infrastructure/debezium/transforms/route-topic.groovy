// Any activity in the followships table should go to the events.followships topic.
if (topic == "events.public.followships")
  return "events.followships"

// Otherwise, it should go to the topic dedicated to the operation type for the tale.
def operation = [c: "created", u: "edited", d: "deleted"][value.op]
if (operation)
  return topic.replace("events.public.", "events.") + "." + operation

return null
